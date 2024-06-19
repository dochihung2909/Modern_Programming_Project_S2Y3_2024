import { format, formatDistanceToNow, parseISO } from 'date-fns'; 
import { enUS } from 'date-fns/locale/en-US';
import { vi } from 'date-fns/locale/vi';
import { Dimensions, Image } from 'react-native';


const formatDate = (dateString) => {
    const date = parseISO(dateString);
    const now = new Date();
  
    // Nếu bài viết trong vòng 24 giờ
    // if (now - date < 24 * 60 * 60 * 1000) {
    //   return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    // }
  
    // Nếu bài viết lâu hơn 24 giờ
    // return format(date, 'PPPpp', { locale: vi }); // Sử dụng 'PPPpp' để định dạng ngày giờ đầy đủ (tùy chỉnh lại theo nhu cầu)
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  };


const formatUrl = (url) => {
  const partToRemove = "image/upload/"; 
  const index = url.indexOf(partToRemove);

        
  if (index !== -1) {
    return url.slice(0, index) + url.slice(index + partToRemove.length);
  } 
  return url 
} 

const resizeImage = (originalWidth, originalHeight, maxWidth = Dimensions.get('window').width, maxHeight = Dimensions.get('window').height) => {
  const aspectRatio = originalWidth / originalHeight; 
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  if (originalWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }

  return { width: newWidth, height: newHeight };
};

const calculateNewImageHeight = (originalWidth, originalHeight, screenWidth = Dimensions.get('window').width) => {
  const aspectRatio = originalWidth / originalHeight;
  const newHeight = screenWidth / aspectRatio; 
  console.log(newHeight, Dimensions.get('window').height / 2)
  return Math.round(newHeight);
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return regex.test(password);
};

function adjustImageTo16x9(screenWidth) {
  const aspectRatio = 16 / 9;
  const newWidth = screenWidth;
  const newHeight = screenWidth / aspectRatio;

  return {
    width: newWidth,
    height: newHeight
  };
}

export { formatDate, formatUrl, resizeImage, calculateNewImageHeight, validateEmail, validatePassword, adjustImageTo16x9 } 