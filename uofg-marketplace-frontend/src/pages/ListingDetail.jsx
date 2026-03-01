import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api/axios"
import { toast } from "react-toastify"

// Displays detailed listing view including comments and seller contact.
// Designed to separate listing data and comments for maintainability.

function ListingDetail() {
  const { id } = useParams()

  const [listing, setListing] = useState(null)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [showPhone, setShowPhone] = useState(false)

  const isLoggedIn = !!localStorage.getItem("access")

  useEffect(() => {
     // Refetch data whenever route parameter changes
    fetchListing()
    fetchComments()
  }, [id])

  const fetchListing = async () => {
    try {
      const res = await api.get(`listings/${id}/`)
      setListing(res.data)
    } catch (err) {
      toast.error("Listing not found")
    }
  }

  const fetchComments = async () => {
    try {
      const res = await api.get(`comments/?listing=${id}`)
      setComments(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Prevent empty submissions to reduce unnecessary API calls
    if (!comment.trim()) return

    try {
      await api.post("comments/", {
        text: comment,
        listing: id
      })

      setComment("")
      fetchComments()
    } catch (err) {
      toast.error("You must be logged in to comment")
    }
  }
// Prevent rendering before data is loaded (avoids undefined errors)
  if (!listing) return null

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        <div>
          {listing.image && (
            <img
              src={listing.image}
              alt={listing.title}
              fetchPriority="high"
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold text-uofg-blue tracking-tight">
            {listing.title}
          </h1>

          <p className="text-2xl font-bold text-gray-800">
            £{listing.price}
          </p>

         {/* 
            Phone number hidden by default.
            Privacy-oriented decision to prevent automatic scraping.
          */}
          {isLoggedIn ? (
            showPhone ? (
              <div className="bg-gray-100 px-5 py-3 rounded-lg shadow-inner text-lg font-semibold tracking-wide text-gray-800">
                {listing.phone_number}
              </div>
            ) : (
              <button
                onClick={() => setShowPhone(true)}
                className="bg-uofg-gold hover:opacity-90 transition text-white px-5 py-3 rounded-lg font-semibold shadow-md"
              >
                Reveal Phone Number
              </button>
            )
          ) : (
            <div className="bg-gray-50 border border-gray-200 px-5 py-3 rounded-lg text-sm text-gray-500">
              Please log in to view contact details.
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Item Description:</h3>
          <div className="bg-gray-100 p-4 rounded-xl shadow-sm leading-relaxed text-gray-700">
            {listing.description}
          </div>
        </div>

        <div className="flex flex-col gap-6">

          <div>
            <h2 className="font-semibold mb-4 text-gray-800">Comments</h2>
 {/* Comments rendered dynamically from backend */}
            <div className="flex flex-col gap-4">
              {comments.map((c) => (
                <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="font-medium text-sm text-uofg-blue">
                    {c.user.username}:
                  </p>
                  <p className="text-gray-700">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
  {/* Controlled input ensures predictable state management */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Add a new comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-uofg-blue"
            />

            <button
              type="submit"
              className="bg-uofg-blue hover:opacity-90 transition text-white px-5 py-2 rounded-lg font-semibold shadow"
            >
              Post Comment
            </button>
          </form>

        </div>

      </div>
    </section>
  )
}

export default ListingDetail