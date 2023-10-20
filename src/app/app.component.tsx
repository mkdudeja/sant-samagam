import clsx from "clsx"
import { collection, getDocs } from "firebase/firestore"
import React from "react"
import { toast } from "react-toastify"
import { firestore } from "../firebase/firebase"
import { IPhonebook } from "../interfaces/shared.interface"
import {
  filterByName,
  filterPhonebook,
  groupByDepartment,
  groupByLocation,
} from "./app.helper"
import {
  FEATURED_CONTACTS,
  FEATURED_EXTNS,
  HELP_TEXT,
  ICT_CONTACTS,
} from "./shared/config"

function App() {
  const [status, setStatus] = React.useState("")
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

  const renderIntercom = (rowData: Array<Partial<IPhonebook>>) => {
    if (!rowData.length) return
    const renderIntercomRow = (item: Partial<IPhonebook>, level = 0) => {
      const hasExtn = !!item.extn
      return (
        <tr key={item.name}>
          <td
            className={clsx(
              "whitespace-nowrap py-1 px-2 lg:py-2 w-6/12 text-sm",
              !hasExtn && "bg-gray-100",
            )}
            colSpan={hasExtn ? 1 : 3}
          >
            <div className={clsx("flex flex-col", level && `ml-6`)}>
              <h4 className="break-words whitespace-normal">{item.name}</h4>
              {hasExtn && (
                <>
                  <div className="flex justify-between items-center lg:hidden print:hidden">
                    <span>{renderPhone(item.phone, item.status)} </span>
                    <span>{renderPhone(item.extn, item.status, false)}</span>
                  </div>
                </>
              )}
            </div>
          </td>
          {hasExtn && (
            <>
              <td className="hidden lg:table-cell print:table-cell whitespace-nowrap px-3 py-2 w-4/12 text-sm text-left">
                {renderPhone(item.phone, item.status)}
              </td>
              <td className="hidden lg:table-cell print:table-cell whitespace-nowrap px-3 py-2 w-2/12 text-sm text-right">
                {renderPhone(item.extn, item.status, false)}
              </td>
            </>
          )}
        </tr>
      )
    }
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <tbody className="divide-y divide-gray-200 bg-white">
            {rowData.map((item) => [
              renderIntercomRow(item),
              ...filterByName(
                (item.children ?? []) as IPhonebook[],
                search,
              )?.map((child) => renderIntercomRow(child, 1)),
            ])}
          </tbody>
        </table>
      </div>
    )
  }

  const renderFeatured = (rowData: Array<Partial<IPhonebook>>) => {
    if (!rowData.length) return
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <tbody className="divide-y divide-gray-200 bg-white">
            {rowData.map((item) => (
              <tr key={item.name}>
                <td className="whitespace-nowrap py-1 px-2 lg:py-2 w-6/12 text-sm">
                  <div className="flex flex-col">
                    <h4 className="break-words whitespace-normal">
                      {item.name}
                    </h4>
                    <div className="flex justify-between items-center lg:hidden print:hidden">
                      <span className="text-gray-500">{item.designation}</span>
                      <span className="">
                        {renderPhone(item.mobile as string, 1)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell print:table-cell whitespace-nowrap px-2 py-2 w-4/12 text-sm">
                  {item.designation}
                </td>
                <td className="hidden lg:table-cell  print:table-cell whitespace-nowrap px-2 py-2 w-2/12 text-sm text-right">
                  {renderPhone(item.mobile as string, 1)}
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

    if (!departmentDataKeys.length) return

    return (
      <div key={locationId}>
        <h1 className="text-base text-center font-semibold leading-6 py-2 pl-4 pr-3 sm:pl-3 border border-gray-200 bg-gray-200">
          {locationId ?? "NA"}
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
            <thead className="print:table-header-group">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 w-7/12 text-left text-sm font-semibold"
                >
                  <div className="justify-between items-center hidden lg:flex print:flex">
                    Name
                  </div>
                  <div className="flex justify-between items-center lg:hidden print:hidden">
                    <span>Name & Phone </span>
                    <span>Extn.</span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="hidden lg:table-cell print:table-cell px-3 py-2 w-3/12 text-left text-sm font-semibold"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="hidden lg:table-cell print:table-cell px-3 py-2 w-2/12 text-right text-sm font-semibold"
                >
                  Extn
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {!!departmentDataKeys.length &&
                Object.keys(departmentDataSource).map((departmentId) =>
                  renderDepartment(
                    locationId,
                    departmentId,
                    departmentDataSource[departmentId],
                  ),
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
            <td className="whitespace-nowrap py-2 pl-4 pr-3 w-7/12 text-sm text-left font-normal">
              <div className="flex flex-col">
                <h4 className="break-words whitespace-normal">{item.name}</h4>
                <div className="flex justify-between items-center lg:hidden print:hidden">
                  <span>{renderPhone(item.phone, item.status)} </span>
                  <span>{renderPhone(item.extn, item.status, false)}</span>
                </div>
              </div>
            </td>
            <td className="hidden lg:table-cell print:table-cell whitespace-nowrap px-3 py-2 w-3/12 text-sm text-left">
              {renderPhone(item.phone, item.status)}
            </td>
            <td className="hidden lg:table-cell print:table-cell whitespace-nowrap px-3 py-2 w-2/12 text-sm text-right">
              {renderPhone(item.extn, item.status, false)}
            </td>
          </tr>
        ))}
      </React.Fragment>
    )
  }

  const renderPhone = (value: string, status: number, dailer = true) => {
    return (
      <div className="inline-flex space-x-1 items-center">
        <button className="print:hidden" onClick={() => copyPhoneno(value)}>
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
        {dailer ? (
          <a
            href={`tel:${value}`}
            target="_blank"
            className={clsx(status ? "text-green-700" : "text-red-700")}
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ) : (
          <span className={clsx(status ? "text-green-700" : "text-red-700")}>
            {value}
          </span>
        )}
      </div>
    )
  }

  const copyPhoneno = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success(`${value} - Copied successfully.`)
  }

  if (!phonebook || !Array.isArray(phonebook)) {
    return
  }

  const locationDataSource = groupByLocation(
    filterPhonebook(phonebook, search, status),
    location,
  )
  const locationDataKeys = Object.keys(locationDataSource)

  const filteredFeaturedExtns = filterByName(
    FEATURED_EXTNS as IPhonebook[],
    search,
  )
  const filteredFeaturedContacts = filterByName(
    FEATURED_CONTACTS as IPhonebook[],
    search,
  )
  const filteredICTContacts = filterByName(ICT_CONTACTS as IPhonebook[], search)

  return (
    <div className="space-y-4 break-before-auto">
      {/* filters */}
      <div className="flex flex-col space-y-2 print:hidden">
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-8">
          <div className="sm:col-span-2 sm:col-start-1">
            <label
              htmlFor="username"
              className="block text-xs text-gray-500 font-medium leading-6"
            >
              Name
            </label>
            <div>
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
              className="block text-xs text-gray-500 font-medium leading-6"
            >
              Department
            </label>
            <div>
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
              className="block text-xs text-gray-500 font-medium leading-6"
            >
              Location
            </label>
            <div>
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

          <div className="sm:col-span-2">
            <label
              htmlFor="location"
              className="block text-xs text-gray-500 font-medium leading-6"
            >
              Status
            </label>
            <div>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="">Select</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center space-x-4 text-sm">
          <div className="flex space-x-1 items-center">
            <span className="flex w-3 h-3 bg-green-700"></span>
            <span>Active</span>
          </div>
          <div className="flex space-x-1 items-center">
            <span className="flex w-3 h-3 bg-red-700"></span>
            <span>Inactive</span>
          </div>
        </div>
      </div>

      {/* featured extension */}
      {!!filteredFeaturedExtns.length && (
        <div className="space-y-2">
          <h2 className="text-center text-md lg:text-base font-semibold">
            Essential Services
          </h2>
          {renderIntercom(filteredFeaturedExtns)}
        </div>
      )}

      {/* featured contacts */}
      {!!filteredFeaturedContacts.length && (
        <div className="space-y-2">
          <h2 className="text-center text-md lg:text-base font-semibold">
            Samagam Committee - All EC Members
          </h2>
          {renderFeatured(filteredFeaturedContacts)}
        </div>
      )}

      {/* ICT members */}
      {!!filteredICTContacts.length && (
        <div className="space-y-2">
          <h2 className="text-center text-md lg:text-base font-semibold">
            Dr. Parveen Khullar Ji (Member In charge ICT)
          </h2>
          {renderFeatured(ICT_CONTACTS)}
        </div>
      )}

      {/* data grids with filters */}
      <div className="space-y-4">
        {/*  data grids */}
        {!!locationDataKeys.length &&
          locationDataKeys.map((key) =>
            renderLocation(key, locationDataSource[key]),
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
