import Link from 'next/link'
import '@/app/styles/selectBtn.css'
import SelectionButton from '@/app/components/selectionButton';
import Hospital from '../../../public/hospital.jpg'
import Store from '../../../public/school.jpg';
import Taxi from '../../../public/job.jpg';

const imagePath = [Hospital, Store, Taxi];
const site: Array<[string, string]> = [['병원', 'hospital'], ['마트', 'store'], ['택시', 'taxi']];

export default function Chat() {
    const hrefPrefix = '/chatbot';

  return (
    <>
      <div className='path'>
          <div className='detail_title'>수어실습</div>
          <div className='top_hr'></div>
      </div>
      <SelectionButton site={site} imagePath={imagePath} hrefPrefix={hrefPrefix} />
    </>


  );
}