import React, { useEffect, useRef, useState } from 'react';
import {
Drawer,
List,
ListItem,
ListItemAvatar,
Avatar,
ListItemText,
Typography,
Divider,
Box,
Paper,
TextField,
IconButton,
Grid,
Skeleton,
Badge,
Tooltip,
Dialog,
DialogContent,
DialogContentText,
DialogTitle,
DialogActions,
Button
} from '@mui/material';
import {AttachFile, InsertEmoticon, Send } from '@mui/icons-material'; 
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, where, doc, setDoc, getDocs,getDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import DeleteIcon from '@mui/icons-material/Delete';

import { onValue, ref } from "firebase/database";

const MessagePage = () => {
const [selectedConversation, setSelectedConversation] = useState(null);
const [message, setMessage] = useState(''); 
const [messages, setMessages] = useState([]);
const [conversations, setConversations] = useState([]);
const [selectedConversationDetails, setSelectedConversationDetails] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [isOpen,setIsOpen] = useState(false);
const [isTyping,setIsTyping] = useState(false);
const typingTimeoutRef = useRef(null);
const [otherUserOnline, setOtherUserOnline] = useState(false);
const [otherUserTyping, setOtherUserTyping] = useState(false);
const messagesEndRef = useRef(null);
const messagesContainerRef = useRef(null);
const _uid = localStorage.getItem("userId");
const token = localStorage.getItem("token");
const userRole = localStorage.getItem("role") === "byr" ? "renter" : "seller";
const senderRole = userRole === "renter" ? "seller" : "renter";


//? Fetch conversation from FireStore
useEffect(() => {
    if(!token) return;

    const q = query(collection(db, "conversations"),
        where ("participants", "array-contains", _uid),
        orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setConversations(snapshot.docs.map(doc => ({id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
},[token, _uid]);


const handleInputChange = (e)=>{
    setMessage(e.target.value);
    if(!isTyping){
        setIsTyping(true);
        updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        updateTypingStatus(false);
    }, 1000);
};

const updateTypingStatus = async (typing) => {
    if(!selectedConversation) return;

    const conversationRef = doc(db, "conversations", selectedConversation);
    await setDoc(conversationRef, { [`typingStatus.${_uid}`]:typing}, {merge : true});
}

//?Change typing Status
useEffect(()=>{
    if(!selectedConversation || !selectedConversationDetails?.participants) return;
    
    const otherUserId = selectedConversationDetails?.participants?.find(id => id !== _uid);
    if (!otherUserId) return;
    const conversationRef = doc(db, "conversations", selectedConversation);
    const unsubscribe =  onSnapshot(conversationRef, (doc) => {
        const data = doc.data();
        
        if (data){
            // alert(JSON.stringify(data,null,2));
            // alert(data[`typingStatus.${otherUserId}`]);
            // console.log(data)
            setOtherUserTyping(data[`typingStatus.${otherUserId}`] || false);
            // console.log(data[`typingStatus.${otherUserId}`] ? "Other user is typing..." : "Other user stopped typing...");
        }
    });

    return () => unsubscribe();
});

//? Set online status
// useEffect(() => {
//     if (!selectedConversationDetails) return;

//     const otherUserId = selectedConversationDetails.participants.find(id => id !== _uid);
//     const statusRef = ref(rtdb, `status/${otherUserId}`);

//     const unsubscribe = onValue(statusRef, (snapshot) => {
//     const status = snapshot.val();
//     setOtherUserOnline(status?.isOnline || false);
//     });

//     return () => unsubscribe();
// }, [selectedConversationDetails, _uid]);

//?Send push-notification
// const SendPushNotification = async(message)=>{
//     try {
//         const response = await sendPushNotification(
//             selectedConversationDetails.senderId,
//             senderRole,
//             `New Message from ${selectedConversationDetails.senderName}`,
//             message
//         );

//         if(response.success){
//             console.log(response.message);
//         }else{
//             console.error("Error in sending push-notification",response.error);
//         }
//     } catch (error) {
//         console.error("Error in sending push-notification",error)
//     }
// }

//? Scroll to new messages
useEffect(() => {
    if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight / 1; 
    }
}, [messages]);

//? CREATE conversation if not exists
const createConversation = async (otherUserId) => {
    const q = query(collection(db, "conversations"), where("participants", "array-contains", _uid));

    const existingConversations = await getDocs(q);
    let conversationId  = null;

    existingConversations.forEach((doc) => {
        if(doc.data().participants.includes(otherUserId)){
            conversationId = doc.id;
        }
    });
    if (!conversationId) {
        const newConversationRef = await addDoc(collection(db, "conversations"), {
        participants: [_uid, otherUserId],
        senderDetails: {
            id: _uid,
            name: "John Doe", 
            profileImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
        receiverDetails: {
            id: otherUserId,
            name: "Alice Johnson",
            profileImg: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        lastMessage: "",
        unreadCount:0,
        lastMessageSenderId: "",
        timestamp: serverTimestamp(),
        });
    
        conversationId = newConversationRef.id;
        // handleConversationClick(conversationId); 
    }

    setSelectedConversation(conversationId);

}

//? DELETE conversation
const deleteConversation = async (selectedConversation)=>{
    if(!selectedConversation) return;

    try{
        await deleteDoc(doc(db, "conversations", selectedConversation));
        console.log("Conversation deleted successfully!");
    }catch(e){
        console.error("Error deleting conversation:", e);
    }

    setSelectedConversation(null);
    setIsOpen(false);
    
}

//? FETCH messages from conversation
const handleConversationClick = async (conversationId) => {
    setIsLoading(true);
    setSelectedConversation(conversationId);

    const conversationRef = doc(db, "conversations", conversationId);

    //* GET selected conversation details
    const conversationSnap = await getDoc(conversationRef);
    if(conversationSnap.exists()){
        const conversationData = conversationSnap.data();
        console.log("Conversation Details", conversationData);

        //* Reset unread count
        if(conversationData.lastMessageSenderId != _uid){
            await setDoc(conversationRef, {unreadCount: 0}, {merge : true});
        }

        setSelectedConversationDetails({
            id : conversationId,
            lastMessage : conversationData.lastMessage,
            participants : conversationData.participants,
            senderName : conversationData.receiverDetails.id != _uid ? conversationData.receiverDetails.name : conversationData.senderDetails.name,
            senderId : conversationData.receiverDetails.id != _uid ? conversationData.receiverDetails.id : conversationData.senderDetails.id,
            senderProfileImg : conversationData.receiverDetails.id != _uid ? conversationData.receiverDetails.profileImg : conversationData.senderDetails.profileImg,
            unreadCount : conversationData.unreadCount,
            timestamp : conversationData.timestamp,
        });

    }else{
        console.log("Conversation Not found.");
        setSelectedConversation(null);
    }

    //? FETCH Messages
    const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setIsLoading(false);

    return unsubscribe;
};

//? Send message to fireStore
const sendMessage = async(e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    const messageRef = collection(db, "conversations", selectedConversation, "messages");

    await addDoc(messageRef, {
        senderId: _uid,
        text: message,
        timestamp : serverTimestamp(),
    });

    //? update last message in conversation
    const conversationRef = doc(db, "conversations", selectedConversation);
    await setDoc(conversationRef, {lastMessage:message, timestamp: serverTimestamp(), unreadCount:(conversationRef.unreadCount || 0)+1, lastMessageSenderId:_uid }, { merge: true });
    // SendPushNotification(message);
    setMessage('');

}

return (
    <Box display="flex" height="85vh" overflow="hidden" mt={12} px={12}>
    {/* Left Drawer for conversations */}
    <Drawer
        variant="permanent"
        sx={{
        width: 400,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
            height: '100%',
            position: 'relative',
            overflowY: 'auto',
            background: 'transparent',
            border: '1px solid #D7D5D5FF',
            borderRadius: '12px 0 0 12px',
        },
        }}
    >
        <Typography variant="h5" px={3} pt={3} style={{ marginLeft: '8px', fontWeight: '600', color: '#000000BC' }}>
        Messages
        </Typography>
        <Box p={3} borderBottom="1px solid #D7D5D5FF">
        
        </Box>
        <List>
        {conversations.map((conversation) => (
            <React.Fragment key={conversation.id}  >
                <ListItem button 
                    onClick={() => handleConversationClick(conversation.id)} 
                    display="flex" 
                    sx={{
                        backgroundColor: selectedConversation === conversation.id ? '#E0E0E05D' : 'transparent',
                        borderLeft: selectedConversation === conversation.id ? '2px solid #1DA1F2' : 'transparent',  
                        '&:hover': {
                            backgroundColor: selectedConversation === conversation.id ? '#e0e0e0' : '#f5f5f5', 
                        },
                    }}
                >
                    <ListItemAvatar>
                    <Avatar alt={conversation.receiverDetails.id != _uid ? conversation.receiverDetails.name : conversation.senderDetails.name} src={ conversation.receiverDetails.id != _uid ? conversation.receiverDetails.profileImg : conversation.senderDetails.profileImg} />
                    </ListItemAvatar>
                    <ListItemText
                    primary={conversation.receiverDetails.id != _uid ? conversation.receiverDetails.name : conversation.senderDetails.name}
                    secondary={
                        <>
                        <Typography component="span" variant="body2" color="textSecondary">
                            {conversation.lastMessage}
                        </Typography>
                        </>
                    }
                    />
                    <Box
                        textAlign="right"
                        px={2}
                    >
                    <ListItemText
                        primary={
                            <Typography component="span" variant="body2" color="textSecondary">
                                {conversation.timestamp ? new Date(conversation.timestamp.toDate()).toLocaleTimeString([], {hour : '2-digit', minute : '2-digit'}) : 'No timestamp'}
                            </Typography>
                        }
                        secondary={
                            conversation.lastMessageSenderId != _uid && (
                                <Badge badgeContent={conversation.unreadCount } color="info" />
                            )
                        }
                        />
                    </Box>
                    </ListItem>
                <Divider variant="inset" component="li" />
            </React.Fragment>
        ))}
        </List>
    </Drawer>

    {/* Main Chat Area */}
    <Box flexGrow={1}  display="flex" flexDirection="column">
        {selectedConversation ? (
        <Paper
            elevation={3}
            style={{
            padding: '20px',
            height: '100%',
            background: 'transparent',
            border: '1px solid #D7D5D5FF',
            borderLeft: 'none',
            borderRadius: '0 12px 12px 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between', 
            }}
        >
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #D7D5D5FF">
                <ListItem alignItems="flex-start">
                <ListItemAvatar>
                    {isLoading ? (
                        <Skeleton variant="circular" width={40} height={40} />
                    ):(
                        <Avatar alt={selectedConversationDetails.senderName}  src={selectedConversationDetails.senderProfileImg} />
                    )}
                </ListItemAvatar>
                <ListItemText
                    primary={selectedConversationDetails ? selectedConversationDetails.senderName : 'Loading...'}                    
                    secondary={
                    <React.Fragment>
                        
                        {otherUserTyping ? (
                            <Typography variant="caption" color="#1DA1F2">
                                {selectedConversationDetails.senderName} is typing...
                            </Typography>
                        ):(
                            <>
                                <Typography 
                                    component="span" 
                                    variant="body2" 
                                    color={otherUserOnline ? "green" : "gray"}
                                    >
                                    {otherUserOnline ? "Online" : "Offline"}
                                </Typography>
                            </>
                        )
                        }
                    </React.Fragment>
                    }
                />
                </ListItem>
                <Grid container spacing={2} display="flex" justifyContent="end" alignContent="center">
                {/* <Grid item>
                    <IconButton aria-label="delete" size="large">
                        <GridSearchIcon fontSize="inherit" />
                    </IconButton>
                </Grid>
                <Grid item>
                    <IconButton aria-label="delete" size="large">
                        <AttachFile fontSize="inherit" />
                    </IconButton>
                </Grid>
                <Grid item>
                    <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#e0e0e0',
                        color: '#4C4949FF',
                        padding: '10px',
                        '&:hover': {
                        backgroundColor: 'darkgray',
                        color: '#e0e0e0',
                        },
                    }}
                    >
                    View Profile
                    </Button>
                </Grid> */}
                    <Grid item>
                    {/* <Tooltip title="Delete conversation">
                        <IconButton>
                            <DeleteIcon color='warning' onClick={()=>{setIsOpen(true)}}/>
                        </IconButton>
                    </Tooltip> */}
                    </Grid>
                </Grid>
            </Box>
            <Divider />
            <Box mt={2} p={5} 
                ref={messagesContainerRef}
                sx={{
                    flexGrow: 1, 
                    overflowY: "auto", 
                    maxHeight: "60vh",
                    minHeight: "60vh",
                }}
            >
            {isLoading ?(
                <>
                <Typography variant="body1" color="textSecondary">
                    Loading...
                </Typography>
                </>
            ):(
                messages.length == 0 ? (
                    <Typography variant="body1" color="textSecondary">
                    No messages yet. Start the conversation!
                    </Typography>
                ):(
                    messages.map((message) => (
                        <Box
                            key={message.id}
                            mb={2}
                            display="flex"
                            flexDirection="column"
                            alignItems={message.senderId === _uid ? 'flex-end' : 'flex-start'}
                        >
                            <Typography
                            variant="body1"
                            maxWidth="50%"
                            backgroundColor={message.senderId === _uid ? '#C4CBE8FF' : '#E7ECF8FF'}
                            color="#000000C2"
                            p={2}
                            borderRadius="8px"
                            lineHeight="1.6"
                            >
                            {message.text}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" >
                                {message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString([], {hour : '2-digit', minute : '2-digit'}) : 'Loading'}
                            </Typography>
                        </Box>
                    ))
                )
            )}
            <div ref={messagesEndRef} />
            </Box>

            {/* //? Message Input Bar */}
            <Box display="flex" alignItems="center" mt={2} p={2} borderTop="1px solid #D7D5D5FF">
                {/* <IconButton>
                    <InsertEmoticon /> 
                </IconButton>
                <IconButton>
                    <AttachFile />
                </IconButton> */}
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleInputChange}
                    sx={{ 
                        "& .MuiOutlinedInput-root": {
                        "& .MuiInputBase-input":{
                            border:"none"
                        }
                        },
                    }}
                />
                <IconButton onClick={sendMessage} disabled={!message.trim()}>
                    <Send />
                </IconButton>
            </Box>
        </Box>

        
        </Paper>
        ) : (
        <Typography variant="h6" color="textSecondary" p={3}>
            Select a conversation to start chatting...
        </Typography>
        )}
    </Box>
    {isOpen && (
        <>
            <Dialog
                onClose={()=>{setIsOpen(false)}}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" color="warning">
                {"Delete Conversation?"}
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this conversation? This action cannot be undone, 
                    and all messages will be permanently removed.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={()=>{setIsOpen(false)}}>Cancel</Button>
                <Button onClick={()=>{deleteConversation(selectedConversation)}} autoFocus color='warning'>
                    Delete
                </Button>
                </DialogActions>
            </Dialog>
        </>
    )}
    </Box>
    
);
};

export default MessagePage;