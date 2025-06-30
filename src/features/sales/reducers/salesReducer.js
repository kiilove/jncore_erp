export const SET_FORM_DATA = "SET_FORM_DATA";
export const SET_ERRORS = "SET_ERRORS";
export const SET_LOADING = "SET_LOADING";
export const RESET_FORM = "RESET_FORM";

export const initialState = {
  formData: {
    customerId: "",
    items: [],
    taxOption: "exclusive",
    discount: 0,
    notes: "",
  },
  errors: {},
  loading: false,
};

export const salesReducer = (state, action) => {
  switch (action.type) {
    case SET_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
    case SET_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case RESET_FORM:
      return initialState;
    default:
      return state;
  }
};
