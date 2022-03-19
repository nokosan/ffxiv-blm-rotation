import {Color, LogCategory} from "./Common";
import { GameState } from "../Game/GameState";
import {GameConfig, ResourceType, SkillReadyStatus} from "../Game/Common";
import {updateTimelineContent} from "../Components/Timeline";


/*
Timeline:

width: multiple of 800px?

 */

export const ElemType = {
	s_Cursor: "s_Cursor",
	DamageMark: "DamageMark",
	Skill: "Skill"
};

function verifyElem(elem) {
	console.assert(elem!==undefined);

	if (elem.type === ElemType.s_Cursor) {
		console.assert(!isNaN(parseFloat(elem.time)));
		return;
	}

	if (elem.type === ElemType.DamageMark) {
		console.assert(!isNaN(parseFloat(elem.time)));
		console.assert(!isNaN(parseFloat(elem.potency)));
		console.assert(elem.source !== undefined);
		return;
	}

	if (elem.type === ElemType.Skill) {
		console.assert(typeof elem.skillName !== undefined);
		console.assert(typeof elem.isGCD !== undefined);
		console.assert(!isNaN(parseFloat(elem.time)));
		console.assert(!isNaN(parseFloat(elem.lockDuration)));
		console.assert(!isNaN(parseFloat(elem.recastDuration)));
		return;
	}

	console.assert(false);
}

export class Timeline {

	constructor() {
		this.scale = 0.25;
		this.startTime = 0;
		this.elapsedTime = 0;
		this.elements = [];
	}

	setTimeSegment(startTime, elapsedTime) {
		this.startTime = startTime;
		this.elapsedTime = elapsedTime;
	}

	addElement(elem) {
		verifyElem(elem);
		this.elements.push(elem);
	}

	// can only update singletons this way
	updateElem(elem) {
		console.assert(elem && elem.type.substring(0, 2)==="s_");
		for (let i = 0; i < this.elements.length; i++) {
			if (this.elements[i].type === elem.type) {
				this.elements[i] = elem;
				return;
			}
		}
		console.assert(false);
	}

	// scale=1 := 100px represents 1s
	setHorizontalScale(inScale) {
		this.scale = inScale;
		this.drawElements();
	}

	getCanvasWidth() {
		let secondsToDraw = Math.ceil((this.elapsedTime + 4) / 8) * 8;
		return secondsToDraw * 100 * this.scale;
	}

	positionFromTime(time) {
		return time * this.scale * 100;
	}

	getTimelineElements() {
		let elemsToDraw = [];
		this.elements.forEach(e=>{
			// cursor
			if (e.type === ElemType.s_Cursor) {
				elemsToDraw.push({
					type: e.type,
					hoverText: (e.time).toFixed(2).toString(),
					left: this.positionFromTime(this.startTime + this.elapsedTime),
				});
			}
			// damage mark
			else if (e.type === ElemType.DamageMark) {
				elemsToDraw.push({
					type: e.type,
					hoverText: e.potency.toFixed(2) + " (" + e.source + ")",
					left: this.positionFromTime(e.time),
				});
			}
			// skill
			else if (e.type === ElemType.Skill) {
				elemsToDraw.push({
					type: e.type,
					left: this.positionFromTime(e.time),
					data: e,
				});
			}
		});
		return elemsToDraw;
	}

	drawElements(filter=(e)=>{ return true; }) {
		let elemsToDraw = this.getTimelineElements();
		updateTimelineContent(this.startTime, this.getCanvasWidth(), elemsToDraw.filter(filter));
	}
}