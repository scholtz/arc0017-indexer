const getAsaId = (stxn: any) => {
  let asa;
  if (stxn.txn.type == 'pay') {
    asa = 0;
  } else {
    asa = stxn.txn.xaid;
  }
  return asa;
};
export default getAsaId;
