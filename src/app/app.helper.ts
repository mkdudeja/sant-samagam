import { IPhonebook } from "../interfaces/shared.interface"
import { DEPARTMENTS, DESIGNATIONS, LOCATIONS } from "./shared/config"

export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(" ")
}

export function getFeaturedPhonebook(data: Array<IPhonebook>) {
  return data
    .filter((item) => item.featured)
    .sort(
      (a, b) =>
        DESIGNATIONS[a.designation].order - DESIGNATIONS[b.designation].order,
    )
}

export function filterByName(data: Array<IPhonebook>, name: string) {
  const regex = new RegExp(`${name ?? ""}`, "i")
  return data.filter((item) => regex.test(item.name))
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
    .sort((a, b) => LOCATIONS[a].order - LOCATIONS[b].order)
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
    .sort((a, b) => DEPARTMENTS[a].order - DEPARTMENTS[b].order)
    .reduce<Record<string, Array<IPhonebook>>>((acc, key) => {
      acc[key] = result[key]
      return acc
    }, {})
}
