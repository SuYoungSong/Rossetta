import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "user",
    initialState: {
        name: "",
        accessToken: "",
        isLogin: null,
    },
    reducers: {
        // login 성공 시
        loginUser: (state, action) => {
            // name, id에 API 값 받아오기
            state.name = action.payload.name;
            state.accessToken = action.payload.token;
            // state 변화를 알림
            return state;
        },
        // login 실패 시
        clearUser: (state) => {
            // name, id 값을 비워줌.
            state.name = "";
            state.accessToken = "";
            // state 변화를 알림
            return state;
        },
    },
});

export const { loginUser, clearUser } = userSlice.actions;
export default userSlice.reducer;