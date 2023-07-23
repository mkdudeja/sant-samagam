import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { collection, getDocs } from "firebase/firestore"
import { firestore } from "../../firebase/firebase"
import { IPhonebook } from "../../interfaces/shared.interface"
import { setPhonebook } from "../state/phonebook/phonebook.slice"

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Phonebook"],
  endpoints: (builder) => ({
    getPhonebook: builder.query<Array<IPhonebook>, void>({
      async queryFn(_, { dispatch }) {
        try {
          const ref = collection(firestore, "phonebook")
          const querySnapshot = await getDocs(ref)
          console.log("querySnapshot", querySnapshot.docs)
          const phonebook = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as Array<IPhonebook>

          dispatch(setPhonebook(phonebook))
          return { data: phonebook }
        } catch (error: any) {
          return { error: error.message }
        }
      },
      providesTags: ["Phonebook"],
    }),
  }),
})

export const { useGetPhonebookQuery } = firestoreApi
