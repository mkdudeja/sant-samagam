export interface IPhonebook {
  id: string
  name: string
  phone: string
  extn: string
  mobile: string
  designation: string
  department: string
  location: string
  featured: boolean
  status: number
  sortOrder: number
  children: Array<Partial<IPhonebook>>
}

export interface IBookFilters {
  name: string
  department: string
  location: string
}
