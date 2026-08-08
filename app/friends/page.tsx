import { FriendManager } from "@/components/friend-manager"
import { ChallengeModal } from "@/components/challenge-modal"
import { UserPlus } from "lucide-react"

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <UserPlus className="text-indigo-400" size={22} />
            Friends
          </h1>
          <ChallengeModal />
        </div>
        <FriendManager />
      </div>
    </div>
  )
}