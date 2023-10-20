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
  "Ground A",
  "Ground B",
  "Ground C",
  "Ground D",
  "Back Stage",
  "Bhakti Niwas",
  "Sant Niwas",
]

export const HELP_TEXT = [
  "** Use STD code 0180 for Direct dial from mobile phones **",
  "Dial the mobile/landline numbers/extension directly and then press # for fast dialing",
  "For Administration Complex block- Delhi dial 011-47660200/201/202/203",
]

export const FEATURED_EXTNS: Array<Partial<IPhonebook>> = [
  {
    name: "Service Helpdesk",
    phone: "0180-6621479",
    extn: "#9",
    status: 1,
  },
  {
    name: "Medical Emergency",
    phone: "0180-6648699",
    extn: "777",
    status: 1,
  },
  {
    name: "Water Supply",
    children: [
      {
        name: "- Ground A",
        phone: "0180-6648622",
        extn: "622",
        status: 1,
      },
      {
        name: "- Ground D",
        phone: "0180-6621467",
        extn: "467",
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
        phone: "0180-6648626",
        extn: "626",
        status: 1,
      },
      {
        name: "- Ground C",
        phone: "0180-6648627",
        extn: "627",
        status: 1,
      },
      {
        name: "- Ground D",
        phone: "0180-6648667",
        extn: "667",
        status: 1,
      },
    ],
  },
  {
    name: "Fire",
    children: [
      {
        name: "- BackStage",
        phone: "0180-6621440",
        extn: "440",
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
    name: "Rev. C.L. Gulati Ji",
    designation: "President",
    mobile: "9266629803",
  },
  {
    name: "Rev. Raj Vasdev Ji",
    designation: "Vice-President",
    mobile: "9266629809",
  },
  {
    name: "Rev. Sukhdev Singh Ji",
    designation: "General Secretary",
    mobile: "9266629807",
  },
  {
    name: "Rev. Dr. Parveen Khullar Ji",
    designation: "Secretary (Hqrs)",
    mobile: "9266629833",
  },
  {
    name: "Rev. Joginder Sukhija Ji",
    designation: "Secretary / Coordinator",
    mobile: "9266629815",
  },
  {
    name: "Rev. J.K. Manchanda Ji",
    designation: "Treasurer",
    mobile: "9266629812",
  },
  {
    name: "Rev. Ashok Manchanda Ji",
    designation: "Member",
    mobile: "9266629810",
  },
  {
    name: "Rev. J.S. Chawla Ji",
    designation: "Member",
    mobile: "9266629840",
  },
  {
    name: "Rev. Raj Kumari (Mami) Ji",
    designation: "Member",
    mobile: "9266629802",
  },
  {
    name: "Rev. H.S. Chawla Ji",
    designation: "Member",
    mobile: "9266629800",
  },
  {
    name: "Rev. Vinod Vohra Ji",
    designation: "Member",
    mobile: "9266629826",
  },
  {
    name: "Rev. Kishan Dass Ji",
    designation: "Member",
    mobile: "9266629816",
  },
  {
    name: "Rev. Manmohan Chhabra (Mohan) Ji",
    designation: "Member",
    mobile: "9266629798",
  },
  {
    name: "Rev. Rakesh Mutreja Ji",
    designation: "Member",
    mobile: "9266629804",
  },
  {
    name: "Rev. Sanjeev Suri Ji",
    designation: "Member",
    mobile: "9266629801",
  },
]
