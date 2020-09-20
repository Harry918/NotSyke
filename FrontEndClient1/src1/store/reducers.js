//socket logic will go here (maybe depending on Harry's redux skills)


const initalState = {
    messages: [],
    members: [],
    socket: {},
    roomID: '',
    start: false,
    loading: false,
    error: '',
    name: '', 
    waiting: false, 
    question: null,
    answer: null,
    color: '',
    out: false,
    userID: null,
    points: [],
    secondaryColor: '',
    page: '',
    leave: false
}

function reducer(state=initalState, action) {
    switch(action.type){
        case 'RET_LOGIN_INFO':
            return{...state, members: action.payload.members, roomID: action.payload.roomID, waiting: action.payload.waiting}
        case 'SET_USER':
            return{...state, name: action.payload}
        case 'ERROR_CRED':
            return{...state, error: action.payload, refresh: !state.refresh}
        case 'SET_SOCKET':
            return{...state, socket: action.payload}
        case 'START_GAME':
            return{...state, start: action.payload, loading: false}
        case 'DISPLAY_QUESTION':
            return{...state, question: action.payload, loading: false}
        case 'SET_CREATOR':
                return{...state}
        case 'RESET_USER':
                return{initalState}
        case 'WAITING_PLAYERS':
                return{...state, loading: true}
        case 'PASS_SCREEN':
                return{...state, loading:false}
        case 'SET_ANSWER_QUESTION':
                return{...state, answer: action.payload.answer, question: action.payload.question}
        case 'CLEAR_ANSWER_QUESTION':
                return{...state, question: null, answer: null}
        case 'PICK_COLOR':
                return{...state, color: action.payload.primary, secondaryColor: action.payload.secondary}
        case 'SET_USER_INFO':
                return{...state, members: action.payload.members, roomID: action.payload.roomID, waiting: action.payload.waiting, out: true, userID: action.payload.userID}
        case 'SET_FINAL_SCORES':
                return{...state, members: action.payload.player, points: action.payload.points}
        case 'SET_PAGE':
                return{...state, page: action.payload}
        case 'LEAVE_PAGE':
                return{...state, leave: true}
        default: 
            return{...state}
    }

}
export default reducer