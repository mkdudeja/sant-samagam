import { IPhonebook } from "../../interfaces/shared.interface"

export const DEPARTMENTS: Array<string> = [
  "Samagam Coordination Committee",
  "Accounts Office",
  "Back Stage",
  "Canteen & Langer Store",
  "Exhibition & Divine Studio",
  "General Store",
  "HRD, Information, Communication & Technology",
  "Prachar Vibhag, Press and Publicity",
  "Publication & Magazine",
  "Security , CCTV & Wireless",
  "Sewadal Office",
  "Transport Office",
  "Miscellaneous",
]

export const DESIGNATIONS: Array<string> = [
  "Chairman",
  "Vice Chairman",
  "Coordinator",
  "Member",
]

export const LOCATIONS: Array<string> = [
  "Ground A - Celebration Ground",
  "Sant Niwas",
  "Bhakti Niwas",
]

export const HELP_TEXT = [
  "** Use STD code 0180 for Direct dial from mobile phones **",
  "Dial the mobile/landline numbers/extension directly and then press # for fast dialing",
  "For Administration Complex block- Delhi dial 011-47660200/201/202/203",
]

export const ICT_CONTACTS: Array<Partial<IPhonebook>> = [
  {
    name: "Rev. Sunil Madan Ji",
    designation: "Coordinator",
    mobile: "9810566269",
  },
  {
    name: "Rev. Avinash Garg Ji",
    designation: "Coordinator",
    mobile: "9266629805",
  },
]

export const FEATURED_CONTACTS: Array<Partial<IPhonebook>> = [
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
