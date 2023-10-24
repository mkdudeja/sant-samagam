import clsx from "clsx"
import React from "react"

const ScrollTop: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = function () {
      const ele = document.documentElement || document.body
      setIsVisible(ele.scrollTop > 250)
    }

    document.addEventListener("scroll", onScroll, false)
    return () => {
      document.removeEventListener("scroll", onScroll, false)
    }
  }, [])

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }

  return (
    <div
      className={clsx(
        "fixed bottom-1 right-1 lg:bottom-4 lg:right-4 transition-opacity animate-bounce duration-200 print:hidden",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      <button onClick={scrollTop}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

export default ScrollTop
