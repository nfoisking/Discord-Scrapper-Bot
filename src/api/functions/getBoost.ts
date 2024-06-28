import { boosts } from "../../utils/boosts";

export type Boost = {
    current_level: string;
    next_level: string;
    current_level_date: Date;
    next_level_date?: Date;
};

export default function (boost?: string, date?: Date) {
    if(boost) {
        const userBoost = boosts.find(b => b.id === boost);
        const boostDate = new Date(date as Date);

        return {
            current_level: userBoost?.name,
            next_level: userBoost?.next_level,
            current_level_date: date,
            next_level_date: new Date(boostDate?.setMonth(boostDate.getMonth() + userBoost?.next_months!)) || null
        } as Boost;
    };
};