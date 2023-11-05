import React from "react"

const Offline = () => {
  React.useEffect(() => {
    const KEY_PHONEBOOK = "eDirectory_phonebook"
    const KEY_LASTSYNCED = "eDirectory_synced"
    const keys = [KEY_PHONEBOOK, KEY_LASTSYNCED]
    keys.forEach((key) => {
      localStorage.removeItem(key)
    })
  }, [])

  return (
    <div className="flex flex-col space-y-5 justify-center items-center min-h-screen">
      <blockquote className="mx-auto max-w-xs p-4 my-4 bg-gray-50 border-l-4 border-gray-300">
        <p className="text-xl italic font-medium leading-relaxed bg-gradient-to-r from-[#3b71ca] to-[#dc4c64] bg-clip-text text-transparent">
          Tuhi Nirankar, <br />
          Mai Teri Sharan Ha, <br />
          Mainu Baksh Lao...
        </p>
      </blockquote>
    </div>
  )
}

export default Offline
