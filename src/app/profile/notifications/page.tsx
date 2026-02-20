"use client"

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Notifications</h1>
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
         <p className="text-gray-500">Vous n'avez aucune nouvelle notification.</p>
      </div>
    </div>
  )
}
