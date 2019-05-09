const sleep = async ms => {
	return new Promise((resolve, _reject) => { setTimeout(resolve, ms) } )
}

export const a = async a => {
	await sleep(100)
	console.log('a')
}

export const b = {
	run: async b => {
		await sleep(10)
		console.log('b')
	}
}

export const c = {
	deps: [a, b],
	run: () => {
		console.log('c')
	}
}
