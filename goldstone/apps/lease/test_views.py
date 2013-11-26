from django.core.urlresolvers import resolve
from django.test.client import Client
from django.test.client import RequestFactory
from django.test import TestCase
from django.utils import timezone


from .views import DeleteLeaseView
from .views import ListLeaseView
from .views import UpdateLeaseView
from .models import Lease
from .models import Notification
from .models import Action


class LeaseViewTest(TestCase):
    """Lease list view tests"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def _create_sample_lease(self):
        Lease.objects.create(name='foo', reason='bar',
                             deleted=False, start_time=timezone.now())

    def test_lease_in_the_context(self):
        client = Client()
        response = client.get('/')
        self.assertEquals(list(response.context['object_list']), [])
        self._create_sample_lease()
        response = client.get('/')
        self.assertEquals(response.context['object_list'].count(), 1)

    def test_lease_in_the_context_request_factory(self):
        factory = RequestFactory()
        request = factory.get('/')
        response = ListLeaseView.as_view()(request)
        self.assertEquals(list(response.context_data['object_list']), [])
        self._create_sample_lease()
        response = ListLeaseView.as_view()(request)
        self.assertEquals(response.context_data['object_list'].count(), 1)

    def test_delete_lease(self):
        self._create_sample_lease()
        self.assertEquals(Lease.objects.count(), 1)
        to_be_deleted = Lease.objects.first()
        factory = RequestFactory()
        request = factory.post('/delete/%s' % to_be_deleted.pk)
        response = DeleteLeaseView.as_view()(request, pk=to_be_deleted.pk)
        self.assertEquals(Lease.objects.count(), 0)

    def test_update_lease(self):
        self._create_sample_lease()
        to_be_edited = Lease.objects.first()
        factory = RequestFactory()
        request = factory.post('/edit/%s' % to_be_edited.pk)
        response = UpdateLeaseView.as_view()(request, pk=to_be_edited.pk)
        self.assertEquals(Lease.objects.count(), 1)