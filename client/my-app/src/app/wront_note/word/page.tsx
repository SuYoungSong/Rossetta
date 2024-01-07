import Link from 'next/link'
import '@/app/styles/selectBtn.css'
import SelectionButton from '@/app/components/selectionButton';
import Hospital from '../../../../../public/hospital.jpg'
import School from '../../../../../public/school.jpg';
import Job from '../../../../../public/job.jpg';

const imagePath = [Hospital, School, Job];
const site: Array<[string, string]> = [['병원', 'hospital'], ['학교', 'school'], ['직업', 'job']];

export default function WrongWord() {
    const hrefPrefix = '/wrong_note/word';

  return (
    <>
      <div className='path'>
          <div className='detail_title'>오답노트 &gt; 단어</div>
          <div className='top_hr'></div>
      </div>
      <SelectionButton site={site} imagePath={imagePath} hrefPrefix={hrefPrefix} />
    </>


  );
}