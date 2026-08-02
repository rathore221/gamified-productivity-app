import { FriendManager } from "@/components/friend-manager"
import { ChallengeModal } from "@/components/challenge-modal"
import { UserPlus } from "lucide-react"

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-wide flex items-center gap-2">
            <UserPlus className="text-purple-400" size={24} />
            Friends
          </h1>
          <ChallengeModal />
        </div>
        <FriendManager />
      </div>
    </div>
  )
}