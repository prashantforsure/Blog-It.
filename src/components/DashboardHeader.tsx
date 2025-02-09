import { Clock, Edit3, TrendingUp } from "lucide-react"

interface DashboardHeaderProps {
  username: string
}

export default function DashboardHeader({ username }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {username}!</h1>
      <p className="text-gray-600 mb-6">Manage your blog posts and create new content.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Total Posts</h3>
            <Edit3 className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold">24</p>
          <p className="text-sm text-gray-500">+3 this week</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Views</h3>
            <TrendingUp className="text-green-500" />
          </div>
          <p className="text-2xl font-bold">1,234</p>
          <p className="text-sm text-gray-500">+15% from last month</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Avg. Read Time</h3>
            <Clock className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold">4m 30s</p>
          <p className="text-sm text-gray-500">-30s from last week</p>
        </div>
      </div>
    </div>
  )
}

