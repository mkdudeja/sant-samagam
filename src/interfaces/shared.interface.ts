export interface IPhonebook {
  id: string
  name: string
  phone: string
  mobile: string
  designation: string
  department: string
  location: string
  featured: boolean
  status: boolean
}

export interface IBookFilters {
  name: string
  department: string
  location: string
}
