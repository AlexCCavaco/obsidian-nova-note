import { ListResource } from "./ListResource";

export type TaskStatusType = { name:string,check:string };
export const UnknownStatus:TaskStatusType = { name:"unknown",check:'x' };
export const TaskStatuses:TaskStatusType[] = [
	/**
	 * Checkbox Status are those supported by Minimal Theme (https://github.com/kepano/obsidian-minimal) as of 2023-04-18
	 */
	{ name:"to-do",check:' ' },
	{ name:"incomplete",check:'/' },
	{ name:"done",check:'x' },
	{ name:"canceled",check:'-' },
	{ name:"forwarded",check:'>' },
	{ name:"scheduling",check:'<' },
	{ name:"question",check:'?' },
	{ name:"important",check:'!' },
	{ name:"star",check:'*' },
	{ name:"quote",check:'"' },
	{ name:"location",check:'l' },
	{ name:"bookmark",check:'b' },
	{ name:"information",check:'i' },
	{ name:"savings",check:'S' },
	{ name:"idea",check:'I' },
	{ name:"pros",check:'p' },
	{ name:"cons",check:'c' },
	{ name:"fire",check:'f' },
	{ name:"key",check:'k' },
	{ name:"win",check:'w' },
	{ name:"up",check:'u' },
	{ name:"down",check:'d' },
	UnknownStatus,
];

export class TaskResource extends ListResource {
	/**
	 * Many of the Task properites are from Obsidian Tasks Plugin (https://obsidian-tasks-group.github.io/obsidian-tasks/) as of 2023-04-18
	 * That is to enable support for that plugin's tasks and interconnection between the plugins by the user
	 * A notable expection is the recurring tasks feature
	 */
	status: typeof TaskStatuses[any];
	priority: "high"|"medium"|"low"|null;

	due: Date|null;
	scheduled: Date|null;
	start: Date|null;
	created: Date|null;
	done: Date|null;

	//TODO

	getPriorityIcon():string|null {
		if(this.priority==="high") return "⏫";
		if(this.priority==="medium") return "🔼";
		if(this.priority==="low") return "🔽";
		return null;
	}

	stringify():string {
		let str = `- [${this.status.check}] ${this.name}`;
		return str;
	}

}

export function checkedToStatus(checkedIcon:string):TaskStatusType {
	for(let status of TaskStatuses){ if(status.check===checkedIcon) return status; }
	return UnknownStatus;
}
