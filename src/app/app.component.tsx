/* eslint-disable @typescript-eslint/no-unused-vars */
import { collection, getDocs } from "firebase/firestore"
import React from "react"
import { firestore } from "../firebase/firebase"
import { IPhonebook } from "../interfaces/shared.interface"
import { filterByName, groupByDepartment, groupByLocation } from "./app.helper"
import { DEPARTMENTS, LOCATIONS } from "./shared/config"

const DEPARTMENT_OPTIONS = Object.keys(DEPARTMENTS).map((key) => ({
  id: key,
  name: DEPARTMENTS[key].name,
}))

const LOCATION_OPTIONS = Object.keys(LOCATIONS).map((key) => ({
  id: key,
  name: LOCATIONS[key].name,
}))

const HELP_TEXT = [
  "** Use STD code 0180 for Direct dial from mobile phones **",
  "Dial the mobile/landline numbers/extension directly and then press # for fast dialing",
  "For Administration Complex block- Delhi dial 011-47660200/201/202/203",
]

const FEATURED: Array<Partial<IPhonebook>> = [
  {
    name: "Rev. Sukhdev Singh Ji",
    designation: "Chairman",
    mobile: "9266629807",
  },
  {
    name: "Rev. Vinod Vohra Ji",
    designation: "Vice Chairman",
    mobile: "9266629826",
  },
  {
    name: "Rev. Joginder Sukhija Ji",
    designation: "Coordinator",
    mobile: "9266629815",
  },
  {
    name: "Rev. Parveen Khullar Ji",
    designation: "Member",
    mobile: "9266629833",
  },
  {
    name: "Rev. J.K. Manchanda Ji",
    designation: "Member",
    mobile: "9266629812",
  },
  {
    name: "Rev. O.P Nirankari Ji",
    designation: "Member",
    mobile: "Member",
  },
]

function App() {
  const [search, setSearch] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [department, setDepartment] = React.useState("")

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
            console.log(newData)
            setPhonebook(newData)
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
      <div className="">
        <h2 className=" text-center underline text-base font-semibold">
          SAMAGAM COORDINATION COMMITTEE
        </h2>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <tbody className="divide-y divide-gray-200 bg-white">
                {rowData.map((item) => (
                  <tr key={item.name}>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0">
                      {item.name}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm">
                      {item.designation}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm">
                      {item.mobile}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderLocation = (locationId: string, rowData: Array<IPhonebook>) => {
    const departmentDataSource = groupByDepartment(rowData, department)
    const departmentDataKeys = Object.keys(departmentDataSource)

    return (
      <div key={locationId}>
        <h1 className="text-base text-center font-semibold leading-6 py-4 pl-4 pr-3 sm:pl-3 border border-gray-200 bg-gray-200">
          {LOCATIONS?.[locationId]?.name ?? "NA"}
        </h1>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 lg:pl-8"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
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
                      className="text-left bg-red-100 text-red-700 py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 lg:pl-8"
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
        <tr className="border-t border-gray-200">
          <th
            colSpan={3}
            scope="colgroup"
            className="bg-gray-100 py-4 pl-4 pr-3 text-left text-sm font-semibold sm:pl-3"
          >
            {DEPARTMENTS?.[departmentId]?.name ?? "NA"}
          </th>
        </tr>
        {rowData.map((item, index) => (
          <tr key={item.id}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 lg:pl-8">
              {item.name}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm">
              {item.phone}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm">
              {item.status ? (
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                  Inactive
                </span>
              )}
            </td>
          </tr>
        ))}
      </React.Fragment>
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
    <div className="mt-6 space-y-6">
      {/* featured phonebook */}
      {renderFeatured(FEATURED)}

      {/* data grids with filters */}
      <div className="space-y-2">
        {/* filters */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
          <div className="sm:col-span-2 sm:col-start-1">
            <label
              htmlFor="city"
              className="block text-sm font-medium leading-6"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="region"
              className="block text-sm font-medium leading-6"
            >
              Department
            </label>
            <div className="mt-1">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="">Select</option>
                {DEPARTMENT_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="postal-code"
              className="block text-sm font-medium leading-6"
            >
              Location
            </label>
            <div className="mt-1">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="">Select</option>
                {LOCATION_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
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
            className="!mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
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
          <li key={index} className="p-4">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
