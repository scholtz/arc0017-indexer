import IEtgCommandTypeEnum from './IEtgCommandTypeEnum';
interface IEtgCommand {
  cmd: IEtgCommandTypeEnum;
  id: string;
  weight: number;
}
export default IEtgCommand;
