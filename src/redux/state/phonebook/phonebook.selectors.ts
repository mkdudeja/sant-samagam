import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../../types"
import { selectAll } from "./phonebook.slice"

const phonebookState = (state: RootState) => state.phonebook

export const selectPhonebook = createSelector(phonebookState, (state) =>
  selectAll(state),
)
