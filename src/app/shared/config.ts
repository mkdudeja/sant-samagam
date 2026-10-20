import { IPhonebook } from "../../interfaces/shared.interface"

// single source of truth for the event name
export const EVENT_NAME: string = import.meta.env.VITE_EVENT_NAME
export const APP_NAME: string = import.meta.env.VITE_APP_NAME
export const APP_TITLE = `${APP_NAME} | ${EVENT_NAME}`

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
  "Ground A",
  "Ground B",
  "Ground C",
  "Ground D",
  "Bhakti Niwas",
  "Sant Niwas",
]

export const HELP_TEXT = [
  "Dial 0 for Direct Calling",
  "Press # for fast dialing after dialing number ",
  "For Administration Complex block - Delhi dial 011-476600200/201/202/203",
]

export const FEATURED_EXTNS_PRIMARY: Array<Partial<IPhonebook>> = [
  {
    name: "Service Helpdesk",
    phone: "0180-6664557",
    extn: "400",
    status: 1,
  },
]

export const FEATURED_EXTNS: Array<Partial<IPhonebook>> = [
  {
    name: "Announcement",
    children: [
      {
        name: "- Ground A",
        phone: "0180-6664576",
        extn: "576",
        status: 1,
      },
    ],
  },
  {
    name: "Electricity",
    children: [
      {
        name: "- Ground A",
        phone: "0180-6621468",
        extn: "468",
        status: 1,
      },
      {
        name: "- Ground B",
        phone: "0180-6664626",
        extn: "626",
        status: 1,
      },
      {
        name: "- Ground C",
        phone: "0180-6664645",
        extn: "645",
        status: 1,
      },
      {
        name: "- Ground D",
        phone: "0180-6664667",
        extn: "667",
        status: 1,
      },
    ],
  },
  {
    name: "Fire Post",
    children: [
      {
        name: "- Ground A",
        phone: "0180-6621440",
        extn: "440",
        status: 1,
      },
    ],
  },
  {
    name: "Medical Emergency Service",
    children: [
      {
        name: "- Ground A",
        phone: "0180-6664699",
        extn: "777",
        status: 1,
      },
    ],
  },
  {
    name: "Water Supply",
    children: [
      {
        name: "- Ground A",
        phone: "0180-6621449",
        extn: "449",
        status: 1,
      },
    ],
  },
  {
    name: "Main Control Room",
    children: [
      {
        name: "- Ground D",
        phone: "0180-6664504",
        extn: "504",
        status: 1,
      },
    ],
  },
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
    name: "Rev. Raj Kumari (Mami) Ji",
    designation: "President",
    mobile: "9266629802",
    extn: "9810450154",
  },
  {
    name: "Rev. Dr. Darshan Singh Ji",
    designation: "Vice President",
    mobile: "7007740067",
    extn: "9450168773",
  },
  {
    name: "Rev. Sukhdev Singh Ji",
    designation: "General Secretary",
    mobile: "9266629807",
    extn: "9216653200",
  },
  {
    name: "Rev. Dr. Parveen Khullar Ji",
    designation: "Secretary (Hqrs)",
    mobile: "9266629833",
    extn: "9810745696",
  },
  {
    name: "Rev. Joginder Sukhija Ji",
    designation: "Secretary / Coordinator",
    mobile: "9266629815",
    extn: "9810315334",
  },
  {
    name: "Rev. J.K. Manchanda Ji",
    designation: "Treasurer",
    mobile: "9266629812",
    extn: "9810532920",
  },
  {
    name: "Rev. Kishan Dass Ji",
    designation: "Member Incharge",
    mobile: "9810792829",
  },
  {
    name: "Rev. Manmohan Chhabra Ji",
    designation: "Member Incharge",
    mobile: "9266629798",
    extn: "9839067627",
  },
  {
    name: "Adv R.K. Kapoor Ji",
    designation: "Member Incharge",
    mobile: "9871603266",
    extn: "9266629999",
  },
  {
    name: "Rev. Rakesh Mutreja Ji",
    designation: "Member Incharge",
    mobile: "9266629804",
    extn: "9818060706",
  },
  {
    name: "Rev. H.S. Guleria Ji",
    designation: "Member Incharge",
    mobile: "8491941178",
  },
]
