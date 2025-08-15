import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { VideoController} from '../controllers/upload.controller';
import { verifyToken } from '../middleware/auth.middleware';
import  upload  from '../middleware/upload.middleware';


const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Authorized', user: (req as any).user });
});

router.post('/upload', upload.single('video'), VideoController.uploadVideo);


export default router;
