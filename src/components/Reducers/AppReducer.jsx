const INITIAL_STATE = {
    echo: null,
    token: null,
    user: {},
    friendships: [],
    friendshipDefaultStyle: '',
    selectedFriend: '',
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'logout':
            return {
                ...state,
                token: null,
                user: {},
            };
        case 'user':
            return {
                ...state,
                user: action.payload,
            };
        case 'login':
            return {
                ...state,
                token: action.payload.token,
                user: action.payload.user,
            };
        case 'echo':
            return {
                ...state,
                echo: action.payload,
            };
        case 'friendships':
            return {
                ...state,
                friendships: action.payload,
            };
        default:
            return {
                ...state,
                [action.type]: action.payload
            };
    }
};
