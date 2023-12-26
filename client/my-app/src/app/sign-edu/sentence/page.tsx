import Link from 'next/link'
import '@/app/sign-edu/selectBtn.css'
import SelectionButton from '../../components/selectionButton';
import Hospital from '../../../../public/hospital.jpg'
import School from '../../../../public/school.jpg';
import Job from '../../../../public/job.jpg';

const imagePath = [Hospital, School, Job];
const site: Array<[string, string]> = [['병원', 'hospital'], ['학교', 'school'], ['직업', 'job']];

export default function Word() {
    const hrefPrefix = '/sign-edu/sentence';

  return (
    <>
      <div className='path'>
          <div className='detail_title'>수어교육 &gt; 문장</div>
          <div className='top_hr'></div>
          <SelectionButton site={site} imagePath={imagePath} hrefPrefix={hrefPrefix} />
      </div>
    </>
    

  );
}