import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardHeaderToolbar } from '../../../../_metronic/_partials/controls'
import Table, { dateFormatter, buttonsStyle, booleanFormatter } from '../../../components/tables/table'
import ConfirmDialog from '../../../components/dialogs/ConfirmDialog'
import { getLanguages, deleteLanguage } from '../../../../api/language'
import { Button, Tooltip } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import { alertError, alertSuccess } from '../../../../utils/logger'
import { useHistory } from 'react-router-dom'

function getData(languages) {
  let data = []
  for (let i = 0; i < languages.length; ++i) {
      const elem = {}
      elem.name = languages[i].fullName
      elem.isocode = languages[i].isocode
      elem.createdAt = languages[i].createdAt
      elem.default = languages[i].isocode === 'es'
      elem.id = languages[i]._id
      data = data.concat(elem)
  }
  return data
}

export default function LanguagesPage() {
  const [data, setData] = useState([])
  const [languageId, setLanguageId] = useState(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const history = useHistory()

  function buttonFormatter(cell) {
    const elem = data.find(item => item.isocode === 'es')?.id
    return (<>
      <Tooltip title="Edit">
        <Button
          style={buttonsStyle} size="small"
          onClick={() => history.push('/edit-language/' + cell)}>
          <EditIcon/>
        </Button>
      </Tooltip>
      {cell !== elem && <Tooltip title="Delete">
        <Button
          style={buttonsStyle} size="small"
          onClick={() => {
            setLanguageId(cell)
            setOpenConfirmDialog(true)
          }}>
          <DeleteIcon/>
        </Button>
      </Tooltip>}
    </>)
  }


  const columns = [
    { dataField: 'name', text: 'Full name', sort: true },
    { dataField: 'isocode', text: 'ISO code', sort: true },
    { dataField: 'default', text: 'Default', sort: true, formatter: booleanFormatter, align: 'center', headerAlign: 'center' },
    { dataField: 'createdAt', text: 'Created at', formatter: dateFormatter, sort: true },
    { dataField: 'id', text: '', formatter: buttonFormatter }
  ]

  useEffect(() => {
    getLanguages().then((res) => {
      if (res.status === 200) {
        setData(getData(res.data))
        setRefresh(false)
      }
    }).catch(error => {
      alertError({ error: error, customMessage: 'Could not get languages.' })
    })
  }, [refresh])

  return (
    <>
      <Card>
        <CardHeader title='Languages list'>
          <CardHeaderToolbar>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => history.push('/edit-language')}
              >
                Add new
              </button>
            </CardHeaderToolbar>
        </CardHeader>
        <CardBody>
          <Table
            data={data}
            columns={columns}
          />
          <ConfirmDialog
            title={'Are you sure you want to remove this language?'}
            open={openConfirmDialog}
            setOpen={setOpenConfirmDialog}
            onConfirm={() => {
              deleteLanguage(languageId).then(res => {
                if (res.status === 204 || res.status === 200) {
                  alertSuccess({  title: 'Deleted!', customMessage: 'Language removed successfully.' })
                  setRefresh(true)
                }
              }).catch(error => {
                alertError({ error: error, customMessage: 'Could not remove language.' })
              })
            }}
          />
        </CardBody>
      </Card>
    </>
  );
}
