import React, { useState, useEffect } from 'react';

const HeaderTitle = ({ title }: { title: string }) => {
	const [current, setTitle] = useState(title || '');
	const [show, setShow] = useState(true);

	useEffect(() => {
		setShow(false);
		setTimeout(() => {
			setTitle(title);
			setShow(true);
		}, 200);
	}, [title]);

	return <span className={`PageTitle${show ? ' __show' : ' __hide'}`}>{current}</span>;
}

export default HeaderTitle;