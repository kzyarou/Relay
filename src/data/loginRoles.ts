import { MonitorSmartphoneIcon, SlidersHorizontalIcon } from 'lucide-react';
import type { Role } from '../types/session';

export const loginRoles: {value: Role;title: string;description: string;Icon: typeof SlidersHorizontalIcon;}[] = [
{
  value: 'controller',
  title: 'Controller',
  description: 'Write as every contact and as the AI. See the receiver’s replies live.',
  Icon: SlidersHorizontalIcon
},
{
  value: 'receiver',
  title: 'Receiver',
  description: 'Use Messenger and ChatGPT as normal. Every reply comes from the controller.',
  Icon: MonitorSmartphoneIcon
}];