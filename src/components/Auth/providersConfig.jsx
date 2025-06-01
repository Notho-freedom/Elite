import {
  FaGithub, FaDiscord, FaTwitter,
  FaApple, FaMicrosoft, FaLinkedin,
  FaFacebookF, FaTelegram
} from 'react-icons/fa';
import { SiAuth0, SiLine, SiSlack } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';

export const PROVIDERS = [
{ 
  name: 'Google', 
  icon: <FcGoogle className="text-xl sm:text-2xl" />, 
  bg: 'bg-gray-200', 
  hover: 'hover:bg-gray-100', 
  text: '' 
},
{ 
  name: 'GitHub', 
  icon: <FaGithub className="text-xl sm:text-2xl" />, 
  bg: 'bg-gray-800', 
  hover: 'hover:bg-gray-700', 
  text: 'text-white' 
},
{ 
  name: 'Twitter', 
  icon: <FaTwitter className="text-xl sm:text-2xl" />, 
  bg: 'bg-sky-500', 
  hover: 'hover:bg-sky-600', 
  text: 'text-white' 
}
,

{ 
  name: 'LinkedIn', 
  icon: <FaLinkedin className="text-xl sm:text-2xl" />, 
  bg: 'bg-blue-600', 
  hover: 'hover:bg-blue-700', 
  text: 'text-white' 
},

{ 
  name: 'Facebook', 
  icon: <FaFacebookF className="text-xl sm:text-2xl" />, 
  bg: 'bg-blue-600', 
  hover: 'hover:bg-blue-700', 
  text: 'text-white' 
},
// Nouveaux providers ajoutés
{ 
  name: 'Telegram', 
  icon: <FaTelegram className="text-xl sm:text-2xl text-blue-500" />, 
  bg: 'bg-blue-100', 
  hover: 'hover:bg-blue-50', 
  text: 'text-blue-600' 
}
/*,
{ 
  name: 'Microsoft', 
  icon: <FaMicrosoft className="text-xl sm:text-2xl" />, 
  bg: 'bg-gray-200', 
  hover: 'hover:bg-gray-200', 
  text: 'text-blue-600' 
},{ 
  name: 'Discord', 
  icon: <FaDiscord className="text-xl sm:text-2xl" />, 
  bg: 'bg-indigo-600', 
  hover: 'hover:bg-indigo-700', 
  text: 'text-white' 
},
{ 
  name: 'Apple', 
  icon: <FaApple className="text-xl sm:text-2xl" />, 
  bg: 'bg-gray-200', 
  hover: 'hover:bg-gray-200', 
  text: 'text-black' 
},
{ 
  name: 'Auth0', 
  icon: <SiAuth0 className="text-xl sm:text-2xl" />, 
  bg: 'bg-orange-200', 
  hover: 'hover:bg-orange-100', 
  text: 'text-orange-700' 
}{ 
  name: 'Line', 
  icon: <SiLine className="text-xl sm:text-2xl text-green-600" />, 
  bg: 'bg-green-100', 
  hover: 'hover:bg-green-50', 
  text: 'text-green-700' 
},
{ 
  name: 'Slack', 
  icon: <SiSlack className="text-xl sm:text-2xl text-purple-600" />, 
  bg: 'bg-purple-100', 
  hover: 'hover:bg-purple-50', 
  text: 'text-purple-700' 
}*/
];