import './ExperienceCardInfo.css';

import '../Button/Button.css';
import type { ExperienceCardInfoProps } from '../../data/types';

export const ExperienceCardInfo = ({ info }: ExperienceCardInfoProps) => {
    // HTML time accepts a year (YYYY), but not a year range. Mark up both
    // endpoints separately and retain the original separator and visible copy.
    const rangeSeparator = ' - ';
    const separatorIndex = info.yearPeriod.indexOf(rangeSeparator);
    const startYear = separatorIndex === -1 ? info.yearPeriod : info.yearPeriod.slice(0, separatorIndex);
    const endYear = separatorIndex === -1 ? null : info.yearPeriod.slice(separatorIndex + rangeSeparator.length);

    return (
        <div className="experience-card__info">
            <p>{info.type}</p>
            <button type="button" className="button">
                <time dateTime={startYear}>{startYear}</time>
                {endYear !== null && <>{rangeSeparator}<time dateTime={endYear}>{endYear}</time></>}
            </button>
        </div>
    );
};
