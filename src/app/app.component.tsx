import { collection, getDocs } from "firebase/firestore"
import React from "react"
import { toast } from "react-toastify"
import { firestore } from "../firebase/firebase"
import { IPhonebook } from "../interfaces/shared.interface"
import { filterByName, groupByDepartment, groupByLocation } from "./app.helper"
import { FEATURED_CONTACTS, HELP_TEXT, ICT_CONTACTS } from "./shared/config"

function App() {
  const [search, setSearch] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [department, setDepartment] = React.useState("")

  const [locOptions, setLocOptions] = React.useState<Array<string>>([])
  const [depOptions, setDepOptions] = React.useState<Array<string>>([])
  const [phonebook, setPhonebook] = React.useState<Array<IPhonebook>>()

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        await getDocs(collection(firestore, "phonebook")).then(
          (querySnapshot) => {
            const newData = querySnapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })) as Array<IPhonebook>
            const locationOptions: Record<string, number> = {}
            const departmentOptions: Record<string, number> = {}
            newData.forEach((item) => {
              if (!departmentOptions[item.department]) {
                departmentOptions[item.department] = 1
              }

              if (!locationOptions[item.location]) {
                locationOptions[item.location] = 1
              }
            })

            setPhonebook(newData)
            setLocOptions(Object.keys(locationOptions).sort())
            setDepOptions(Object.keys(departmentOptions).sort())
          },
        )
      } catch (err) {
        console.error(err)
      }
    }

    fetchPost()
  }, [])

  const renderFeatured = (rowData: Array<Partial<IPhonebook>>) => {
    if (!rowData.length) return
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <tbody className="divide-y divide-gray-200 bg-white">
            {rowData.map((item) => (
              <tr key={item.name}>
                <td className="whitespace-nowrap py-1 px-2 lg:py-2 w-2/4 text-sm">
                  {item.name}
                  <div className="flex justify-between items-center lg:hidden print:hidden">
                    <span className="text-gray-500">{item.designation}</span>
                    <span className="">
                      {renderPhone(item.mobile as string)}
                    </span>
                  </div>
                </td>
                <td className="hidden lg:table-cell print:table-cell whitespace-nowrap px-2 py-2 w-1/4 text-sm">
                  {item.designation}
                </td>
                <td className="hidden lg:table-cell  print:table-cell whitespace-nowrap px-2 py-2 w-1/4 text-sm">
                  {renderPhone(item.mobile as string)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderLocation = (locationId: string, rowData: Array<IPhonebook>) => {
    const departmentDataSource = groupByDepartment(rowData, department)
    const departmentDataKeys = Object.keys(departmentDataSource)

    return (
      <div key={locationId}>
        <h1 className="text-base text-center font-semibold leading-6 py-2 pl-4 pr-3 sm:pl-3 border border-gray-200 bg-gray-200">
          {locationId ?? "NA"}
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
            <thead className="hidden print:hidden lg:table-header-group">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 w-2/4 text-left text-sm font-semibold"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 w-1/4 text-left text-sm font-semibold"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 w-1/4 text-center text-sm font-semibold"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {!departmentDataKeys.length ? (
                <tr className="border-t border-gray-200">
                  <th
                    colSpan={3}
                    scope="colgroup"
                    className="text-left bg-red-100 text-red-700 py-2 pl-4 pr-3 text-sm font-medium"
                  >
                    No data found.
                  </th>
                </tr>
              ) : (
                Object.keys(departmentDataSource).map((departmentId) =>
                  renderDepartment(
                    locationId,
                    departmentId,
                    departmentDataSource[departmentId],
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderDepartment = (
    locationId: string,
    departmentId: string,
    rowData: Array<IPhonebook>,
  ) => {
    return (
      <React.Fragment key={`${locationId}-${departmentId}`}>
        <tr className="border-t border-gray-200 bg-gray-100">
          <th
            colSpan={3}
            scope="colgroup"
            className="py-2 pl-4 pr-3 text-left text-sm font-semibold sm:pl-3"
          >
            {departmentId ?? "NA"}
          </th>
        </tr>
        {rowData.map((item, index) => (
          <tr key={item.id}>
            <td className="whitespace-nowrap py-2 pl-4 pr-3 w-2/4 text-sm font-normal">
              {item.name}
              <div className="flex justify-between items-center lg:hidden print:hidden">
                <span className="text-gray-500">
                  {renderPhone(item.phone, item.extn)}
                </span>
                <span className="">{renderStatus(item.status)}</span>
              </div>
            </td>
            <td className="hidden lg:table-cell print:table-cell whitespace-nowrap px-3 py-2 w-1/4 text-sm">
              {renderPhone(item.phone, item.extn)}
            </td>
            <td className="hidden lg:table-cell print:hidden whitespace-nowrap px-3 py-2 w-1/4 text-sm text-center">
              {renderStatus(item.status)}
            </td>
          </tr>
        ))}
      </React.Fragment>
    )
  }

  const renderPhone = (phone: string, extn: string = "") => {
    let phoneno = extn ? `${phone},${extn}` : phone
    return (
      <div className="flex space-x-1 items-center">
        <button className="print:hidden" onClick={() => copyPhoneno(phoneno)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z"
            />
          </svg>
        </button>
        <a
          href={`tel:${phoneno}`}
          target="_blank"
          className="text-blue-700"
          rel="noopener noreferrer"
        >
          {phone}
          {!!extn && <React.Fragment>/ {extn ?? "-"}</React.Fragment>}
        </a>
      </div>
    )
  }

  const copyPhoneno = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success("Copied successfully.")
  }

  const renderStatus = (status: boolean) => {
    return status ? (
      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm text-green-700 ring-1 ring-inset ring-green-600/20">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
        Inactive
      </span>
    )
  }

  if (!phonebook || !Array.isArray(phonebook)) {
    return
  }

  const locationDataSource = groupByLocation(
    filterByName(phonebook, search),
    location,
  )
  const locationDataKeys = Object.keys(locationDataSource)

  return (
    <div className="space-y-4 break-before-auto">
      {/* ICT members */}
      <div className="space-y-2">
        <h2 className="text-center text-md lg:text-base font-semibold">
          Dr. Parveen Khullar Ji (Member In charge ICT)
        </h2>
        {renderFeatured(ICT_CONTACTS)}
        <p className="text-xs italic !mt-1">
          ICT Helpdesk : 121 (Dial from your Intercom)
        </p>
      </div>

      {/* featured contacts */}
      <div className="space-y-2">
        <h2 className="text-center text-md lg:text-base font-semibold">
          SAMAGAM COORDINATION COMMITTEE
        </h2>
        {renderFeatured(FEATURED_CONTACTS)}
      </div>

      {/* data grids with filters */}
      <div className="space-y-4">
        {/* filters */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6 print:hidden">
          <div className="sm:col-span-2 sm:col-start-1">
            <label
              htmlFor="username"
              className="block text-sm font-medium leading-6"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="username"
                value={search}
                autoComplete="off"
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="department"
              className="block text-sm font-medium leading-6"
            >
              Department
            </label>
            <div className="mt-1">
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="">Select</option>
                {depOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="location"
              className="block text-sm font-medium leading-6"
            >
              Location
            </label>
            <div className="mt-1">
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="">Select</option>
                {locOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/*  data grids */}
        {!locationDataKeys.length ? (
          <div
            role="alert"
            className="!mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded"
          >
            <span className="block sm:inline">No data found.</span>
          </div>
        ) : (
          locationDataKeys.map((key) =>
            renderLocation(key, locationDataSource[key]),
          )
        )}
      </div>

      {/* help text */}
      <ul className="divide-y divide-gray-200 border border-gray-200">
        {HELP_TEXT.map((item, index) => (
          <li key={index} className="py-2 px-4 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
