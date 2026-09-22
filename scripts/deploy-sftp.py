"""Upload dist to the dedicated Silverback folder; never delete remote files."""
import os
import posixpath
import stat
from pathlib import Path
import paramiko

required = ('UD_SFTP_HOST', 'UD_SFTP_USER', 'UD_SFTP_PASSWORD')
missing = [name for name in required if not os.environ.get(name)]
if missing:
    raise SystemExit('Missing repository secrets: ' + ', '.join(missing))

client = paramiko.SSHClient()
client.load_system_host_keys()
# Optional pinning; otherwise trust this newly configured host on first connection.
known_hosts = os.environ.get('UD_SFTP_KNOWN_HOSTS', '').strip()
if known_hosts:
    from tempfile import NamedTemporaryFile
    with NamedTemporaryFile(mode='w') as file:
        file.write(known_hosts + '\n')
        file.flush()
        client.load_host_keys(file.name)
else:
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

client.connect(os.environ['UD_SFTP_HOST'], port=22,
               username=os.environ['UD_SFTP_USER'], password=os.environ['UD_SFTP_PASSWORD'],
               look_for_keys=False, allow_agent=False, timeout=30,
               banner_timeout=30, auth_timeout=30)
try:
    with client.open_sftp() as sftp:
        home = sftp.normalize('.')
        target = posixpath.join(home, 'silverback')
        def directory(folder):
            try:
                info = sftp.lstat(folder)
                if not stat.S_ISDIR(info.st_mode):
                    raise RuntimeError('Deployment target must be a real directory, not a symlink')
            except FileNotFoundError:
                sftp.mkdir(folder)
        directory(target)
        root = Path('dist')
        files = [file for file in root.rglob('*') if file.is_file()]
        # Dependencies first, HTML last. Each file is replaced atomically.
        files.sort(key=lambda file: (file.suffix == '.html', file.name == 'index.html', str(file)))
        for file in files:
            relative = file.relative_to(root).as_posix()
            remote = posixpath.join(target, relative)
            folder = target
            for part in file.relative_to(root).parts[:-1]:
                folder = posixpath.join(folder, part)
                directory(folder)
            temporary = remote + '.upload-' + os.environ.get('GITHUB_RUN_ID', 'manual')
            sftp.put(str(file), temporary, confirm=True)
            sftp.chmod(temporary, 0o644)
            sftp.posix_rename(temporary, remote)
        print(f'Uploaded {len(files)} files to the dedicated silverback folder. No remote files deleted.')
finally:
    client.close()
