import { FC } from 'react';
import { Overlay, Spinner_lds_ring } from '../utils/styles';
type Props = {
    children: React.ReactNode
}
export const Spinner: FC<Props> = ({ children }) => <Overlay>{children}</Overlay>;

export const Spinner_ring: FC<{ size?: number; border?: number; color?: string; } & React.HTMLAttributes<HTMLDivElement>> = ({ size = 80, border = 8, color = '#fff', ...rest }) => <Spinner_lds_ring $size={size} $border={border} $color={color} {...rest}><div/><div/><div/><div/></Spinner_lds_ring>;
