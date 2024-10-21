import { Router } from "express";
import { upload } from "../middeware/multer";
import { dashboard, getAgency, getChatRooms, getMessages, getMessagesByChatRoomId, initiateChat, loginUser, messages, registerUser, sendMessage, updateStatus} from '../controllers/userController'
import { authMiddleware } from "../middeware/auth";
const router = Router();

router.post('/register', upload,  registerUser);
router.post("/login", loginUser);
router.get("/dashboard",dashboard);
router.post("/update-status", updateStatus);
router.post('/chat',initiateChat);
router.post('/send-message',sendMessage);
router.get('/chatrooms/:chatRoomId/message',getMessagesByChatRoomId)
router.get("/agencies", getAgency);
router.get("/chatrooms",getChatRooms);
router.post("/messages", messages);
router.get("/messages/:roomId", getMessages);

export default router;