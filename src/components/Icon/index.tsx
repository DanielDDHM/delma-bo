import React from 'react';

interface Props extends React.HTMLProps<HTMLElement> {
	name: string;
}

const Icon = ({ name, className, ...props }: Props) => (
	<em className={`moon-${name}${className ? ` ${className}` : ''}`} {...props} />
);

export default Icon;
