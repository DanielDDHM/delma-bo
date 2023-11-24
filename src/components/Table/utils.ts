export const getStyles = (
	props: any,
	align = 'left',
	maxWidth: number | string
) => [
		props,
		{
			style: {
				justifyContent: align === 'right' ? 'flex-end' : (align === 'center' ? 'center' : 'flex-start'),
				alignItems: 'flex-start',
				display: 'flex',
				maxWidth,
			},
		},
	];
