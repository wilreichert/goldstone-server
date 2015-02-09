"""Goldstone secret key."""
# Copyright 2012 Nebula, Inc.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.
from __future__ import with_statement  # Python 2.5 compliance

import grp
import lockfile
import logging
import os
import pwd
import random
import string

logger = logging.getLogger(__name__)


class FilePermissionError(Exception):
    """The key file permissions are insecure."""

    pass


def generate_key(key_length=64):
    """Secret key generator.

    The quality of randomness depends on operating system support,
    see http://docs.python.org/library/random.html#random.SystemRandom.

    """

    choice = random.SystemRandom().choice if hasattr(random, 'SystemRandom') \
        else random.choice

    return ''.join(map(lambda x: choice(string.digits + string.letters),
                   range(key_length)))


def generate_or_read_from_file(key_file='.secret_key', key_length=64,
                               uid_and_gid='apache'):
    """Multiprocess-safe secret key file generator.

    Useful to replace the default (and thus unsafe) SECRET_KEY in settings.py
    upon first start. Save to use, i.e. when multiple Python interpreters
    serve the dashboard Django application (e.g. in a mod_wsgi + daemonized
    environment).  Also checks if file permissions are set correctly and
    throws an exception if not.

    """

    lock = lockfile.FileLock(key_file)

    with lock:
        if not os.path.exists(key_file):
            key = generate_key(key_length)
            old_umask = os.umask(0o177)  # Use '0600' file permissions

            with open(key_file, 'w') as f:
                f.write(key)

            os.umask(old_umask)

            try:
                uid = pwd.getpwnam(uid_and_gid).pw_uid
                gid = grp.getgrnam(uid_and_gid).gr_gid
                os.chown(key_file, uid, gid)
            except Exception:       # pylint: disable=W0703
                logger.debug("Error changing permission on secret file to %s",
                             uid_and_gid)
        else:
            if oct(os.stat(key_file).st_mode & 0o777) != '0600':
                raise FilePermissionError("Insecure key file permissions!")

            with open(key_file, 'r') as f:
                key = f.readline()

        return key
