const rooms = {
	1: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
	2: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210],
	3: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310],
	4: [401, 402, 403, 404, 405, 406, 407, 408, 409, 410],
	5: [501, 502, 503, 504, 505, 506, 507, 508, 509, 510],
	6: [601, 602, 603, 604, 605, 606, 607, 608, 609, 610],
	7: [701, 702, 703, 704, 705, 706, 707, 708, 709, 710],
	8: [801, 802, 803, 804, 805, 806, 807, 808, 809, 810],
	9: [901, 902, 903, 904, 905, 906, 907, 908, 909, 910],
	10: [1001, 1002, 1003, 1004, 1005, 1006, 1007],
}

let bookedRooms = []
let lastBookedRooms = []

$(document).ready(function () {
	hydrateRooms()
})

function hydrateRooms() {
	$('.floors').html('')

	Object.keys(rooms)
		.sort((a, b) => b - a)
		.forEach((floorNumber) => {
			const $floor = $('<div>').addClass('floor')

			rooms[floorNumber].forEach((roomNumber) => {
				const $room = $('<div>').addClass('room').text(roomNumber)

				if (bookedRooms.includes(roomNumber)) $room.addClass('booked-room')
				if (lastBookedRooms.includes(roomNumber)) $room.addClass('last-booked-room')

				$floor.append($room)
			})

			$('.floors').append($floor)
		})
}

$('#reset-button').click(() => {
	bookedRooms = []
	lastBookedRooms = []
	hydrateRooms()
})

$('#random-button').click(() => {
	const allRooms = Object.values(rooms).flat()
	const randomCount = Math.floor(Math.random() * allRooms.length) + 1
	const shuffled = allRooms.sort(() => 0.5 - Math.random())
	const selectedRooms = shuffled.slice(0, randomCount)
	bookedRooms = [...selectedRooms]
	lastBookedRooms = []
	hydrateRooms()
})

$('#book-button').click(() => {
	const numberOfRooms = parseFloat($('#room-input').val())

	if (Number.isNaN(numberOfRooms)) {
		alert('Please enter a valid number.')
		return
	}

	if (!Number.isInteger(numberOfRooms)) {
		alert('Please enter a whole number.')
		return
	}

	if (numberOfRooms < 1 || numberOfRooms > 5) {
		alert('You can book 1 - 5 rooms at a time.')
		return
	}

	if (bookedRooms.length + numberOfRooms > 97) {
		alert('Not enough rooms available to fulfill your request.')
		return
	}

	const selectedRooms = bookRooms(numberOfRooms)

	if (!selectedRooms || selectedRooms.length === 0) {
		alert('Not enough rooms available to fulfill your request.')
		return
	}

	bookedRooms.push(...selectedRooms)
	lastBookedRooms = [...selectedRooms]
	hydrateRooms()
})

function bookRooms(numberOfRooms) {
	const availableRooms = []
	Object.keys(rooms).forEach((floor) => {
		rooms[floor].forEach((room) => {
			if (!bookedRooms.includes(room)) {
				availableRooms.push({ room, floor: parseInt(floor) })
			}
		})
	})

	if (numberOfRooms === 1) {
		let minTime = Infinity
		let selected = null
		availableRooms.forEach((r) => {
			const time = r.floor * 2 + floorIndex(r.floor, r.room)
			if (time < minTime) {
				minTime = time
				selected = r.room
			}
		})
		return [selected]
	}

	for (let floor = 1; floor <= 10; floor++) {
		const floorRooms = availableRooms.filter((r) => r.floor === floor)
		if (floorRooms.length >= numberOfRooms) {
			const sorted = floorRooms.sort((a, b) => floorIndex(a.floor, a.room) - floorIndex(b.floor, b.room))
			const selected = sorted.slice(0, numberOfRooms)
			return selected.map((r) => r.room)
		}
	}

	const combinations = kCombinations(availableRooms, numberOfRooms)
	let bestCombo = null
	let minTravel = Infinity

	combinations.forEach((combo) => {
		let travel = 0
		const sortedCombo = combo.slice().sort((a, b) => {
			return a.floor - b.floor || floorIndex(a.floor, a.room) - floorIndex(b.floor, b.room)
		})
		for (let i = 0; i < sortedCombo.length - 1; i++) {
			travel += travelTime(sortedCombo[i], sortedCombo[i + 1])
		}
		if (travel < minTravel) {
			minTravel = travel
			bestCombo = sortedCombo
		}
	})

	if (!bestCombo) return []
	return bestCombo.map((r) => r.room)
}

function floorIndex(floor, room) {
	return rooms[floor].indexOf(room)
}

function travelTime(r1, r2) {
	const vertical = Math.abs(r1.floor - r2.floor) * 2
	const horizontal = Math.abs(floorIndex(r1.floor, r1.room) - floorIndex(r2.floor, r2.room))
	return vertical + horizontal
}

function kCombinations(arr, k) {
	const results = []
	if (k === 1) return arr.map((e) => [e])
	if (arr.length === k) return [arr]
	for (let i = 0; i <= arr.length - k; i++) {
		const head = arr[i]
		const tailCombos = kCombinations(arr.slice(i + 1), k - 1)
		tailCombos.forEach((tail) => results.push([head, ...tail]))
	}
	return results
}
