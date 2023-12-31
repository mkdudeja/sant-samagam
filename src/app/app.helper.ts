import { IPhonebook } from "../interfaces/shared.interface"
import { DESIGNATIONS, LOCATIONS } from "./shared/config"

export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(" ")
}

export function filterByName(data: Array<IPhonebook>, name: string) {
  const regex = new RegExp(`${name ?? ""}`, "i")
  return data.filter((item) => {
    if (item.children) {
      return item.children.some((child) => regex.test(child.name))
    }

    return regex.test(item.name)
  })
}

export function getFeaturedPhonebook(data: Array<IPhonebook>) {
  return data
    .filter((item) => item.featured)
    .sort((a, b) => {
      const aOrder = DESIGNATIONS.indexOf(a.designation)
      const bOrder = DESIGNATIONS.indexOf(b.designation)
      return aOrder - bOrder
    })
}

export function filterPhonebook(
  data: Array<IPhonebook>,
  name: string,
  status: string = "",
) {
  const validateStatus =
    typeof status !== "undefined" && status !== null && !!status
  const statusValue = validateStatus && Number(status)
  const hello = filterByName(data, name)
    .filter((item) => (validateStatus ? item.status === statusValue : true))
    .sort((a, b) => {
      const aSortOrder = a.sortOrder
      const bSortOrder = b.sortOrder
      if (aSortOrder && bSortOrder) {
        return aSortOrder - bSortOrder
      } else {
        return a.name.localeCompare(b.name, "en", { numeric: true })
      }
    })
  return hello
}

export function groupByLocation(
  data: Array<IPhonebook>,
  location: string = "",
) {
  const result = data
    .filter((item) => !location || item.location === location)
    .reduce<Record<string, Array<IPhonebook>>>((acc, item) => {
      if (!acc[item.location]) {
        acc[item.location] = []
      }

      acc[item.location].push(item)
      return acc
    }, {})

  return Object.keys(result)
    .sort((a, b) => {
      const aOrder = LOCATIONS.indexOf(a)
      const bOrder = LOCATIONS.indexOf(b)
      return aOrder - bOrder
    })
    .reduce<Record<string, Array<IPhonebook>>>((acc, key) => {
      acc[key] = result[key]
      return acc
    }, {})
}

export function groupByDepartment(
  data: Array<IPhonebook>,
  department: string = "",
) {
  const result = data
    .filter((item) => !department || item.department === department)
    .reduce<Record<string, Array<IPhonebook>>>((acc, item) => {
      if (!acc[item.department]) {
        acc[item.department] = []
      }

      acc[item.department].push(item)
      return acc
    }, {})

  return Object.keys(result)
    .sort((a, b) => {
      // const aOrder = DEPARTMENTS.indexOf(a)
      // const bOrder = DEPARTMENTS.indexOf(b)
      // return aOrder - bOrder
      return a.localeCompare(b)
    })
    .reduce<Record<string, Array<IPhonebook>>>((acc, key) => {
      acc[key] = result[key]
      return acc
    }, {})
}
