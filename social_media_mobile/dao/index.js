import { format, formatDistanceToNow, parseISO } from 'date-fns'; 
import { enUS } from 'date-fns/locale/en-US';
import { vi } from 'date-fns/locale/vi';


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
}

export { formatDate, formatUrl } 