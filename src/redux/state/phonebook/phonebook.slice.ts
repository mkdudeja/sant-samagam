import type { PayloadAction } from "@reduxjs/toolkit"
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit"
import { IPhonebook } from "../../../interfaces/shared.interface"

const phonebookAdapter = createEntityAdapter<IPhonebook>()

const phonebookSlice = createSlice({
  name: "counter",
  initialState: phonebookAdapter.getInitialState(),
  reducers: {
    setPhonebook(state, action: PayloadAction<Array<IPhonebook>>) {
      phonebookAdapter.setAll(state, action.payload)
    },
  },
})

export const { setPhonebook } = phonebookSlice.actions
export const { selectAll } = phonebookAdapter.getSelectors()
export default phonebookSlice.reducer
