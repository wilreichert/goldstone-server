"""User settings."""
# Copyright 2015 Solinea, Inc.
#
# Licensed under the Solinea Software License Agreement (goldstone),
# Version 1.0 (the "License"); you may not use this file except in compliance
# with the License. You may obtain a copy of the License at:
#
#     http://www.solinea.com/goldstone/LICENSE.pdf
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either expressed or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from django.conf import settings
from django.db import models


class Settings(models.Model):
    """User settings, a.k.a, preferences.

    These are items that we will allow the user to change on his/her own
    account.

    """

    # User row
    user = models.OneToOneField(settings.AUTH_USER_MODEL)

    class Meta:                     # pylint: disable=C0111,W0232,C1001
        verbose_name_plural = "settings"

    def __unicode__(self):
        """Return a useful string."""

        return u'%s' % self.user.username         # pylint: disable=E1101
