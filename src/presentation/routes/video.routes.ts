import { Router } from 'express';
import { VideoController} from '../controllers/upload.controller';
import  upload  from '../middleware/upload.middleware';


const router = Router();


router.post('/video', upload.single('video'), VideoController.uploadVideo);


export default router;
