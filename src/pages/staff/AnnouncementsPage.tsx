import AnnouncementManager, { type Announcement } from '../../components/shared/AnnouncementManager'
import { PageHeader } from '../../components/ui'
import { staffCommunityApi } from '../../shared/api'

const staffAnnouncementApi = {
  get: () => staffCommunityApi.getAnnouncements<Announcement>(),
  create: staffCommunityApi.createAnnouncement,
  update: staffCommunityApi.updateAnnouncement,
  remove: staffCommunityApi.deleteAnnouncement,
}

export default function AnnouncementsPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Public information"
        title="Announcements"
        description="Create and manage barangay announcements. Publishing notifies residents and sends email."
      />
      <AnnouncementManager api={staffAnnouncementApi} />
    </section>
  )
}
