import React, { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../../../_metronic/_partials/controls'
import {
	Button,
	TextField,
	MuiThemeProvider,
	createMuiTheme
} from '@material-ui/core'
import { useHistory, useParams } from 'react-router-dom'
import { deleteLanguage, getLanguageById, postLanguage, updateLanguage } from '../../../../api/language'
import { useSkeleton } from '../../../hooks/useSkeleton'
import { alertError, alertSuccess } from '../../../../utils/logger'
import ConfirmDialog from '../../../components/dialogs/ConfirmDialog'

// Create theme for delete button (red)
const theme = createMuiTheme({
	palette: {
		secondary: {
			main: '#F64E60'
		}
  }
})

function getEmptyLanguage() {
  return {
    fullName: '',
    isocode: ''
  }
}

export default function EditLanguagesPage() {
  const [language, setLanguage] = useState(getEmptyLanguage())
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const languageId = useParams().id
  const history = useHistory()

  const { isLoading: isLoadingData, disableLoading: disableLoadingData, ContentSkeleton } = useSkeleton()

  useEffect(() => {
    if (!languageId) {
      disableLoadingData()
      return
    }
    getLanguageById(languageId).then(res => {
      if (res.status === 200) {
        setLanguage(res.data)
        disableLoadingData()
      }
    }).catch(error => {
      alertError({ error: error, customMessage: 'Could not get language.' })
      history.push('/languages')
    })
  }, [languageId, disableLoadingData, history])

  function saveLanguage() {
    if (!languageId) {
      postLanguage(language).then(res => {
        if (res.status === 201) {
          alertSuccess({ title: 'Saved!', customMessage: 'Language successfully created.' })
          history.push('/languages')
        }
      }).catch(error => {
        alertError({ error: error, customMessage: 'Could not save language.' })
      })
    } else {
      updateLanguage(languageId, language).then(res => {
        if (res.status === 200) {
          alertSuccess({ title: 'Saved!', customMessage: 'Changes successfully saved.' })
          history.push('/languages')
        }
      }).catch(error => {
        alertError({ error: error, customMessage: 'Could not save changes.' })
      })
    }
  }

  const handleChange = (element) => (event) => {
    setLanguage({ ...language, [element]: event.target.value })
  }

  if (isLoadingData)
    return <ContentSkeleton />
  else return (
    <>
      <Card>
        <CardHeader title='Edit language'>
        </CardHeader>
        <CardBody>
          <TextField
            id={`fullName`}
            label="Full name"
            value={language.fullName}
            onChange={handleChange('fullName')}
            InputLabelProps={{
              shrink: true
            }}
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            id={`isocode`}
            label="ISO code"
            value={language.isocode}
            onChange={handleChange('isocode')}
            InputLabelProps={{
              shrink: true
            }}
            margin="normal"
            variant="outlined"
            required
            disabled={languageId}
          />
        </CardBody>
      </Card>
      <Button
        onClick={() => history.push('/languages')}
        variant="outlined"
        style={{ marginRight: '20px' }}>
        Back
      </Button>
      <Button
        onClick={() => saveLanguage()}
        variant="outlined"
        color="primary"
        style={{ marginRight: '20px' }}>
        Save language
      </Button>
      {languageId && language.isocode !== 'es' && <>
        <MuiThemeProvider theme={theme}>
          <Button
            onClick={() => setOpenConfirmDialog(true)}
            variant="outlined"
            color="secondary">
            Delete language
          </Button>
        </MuiThemeProvider>

        <ConfirmDialog
          title={'Are you sure you want to delete this language?'}
          open={openConfirmDialog}
          setOpen={setOpenConfirmDialog}
          onConfirm={() => {
            deleteLanguage(languageId).then(res => {
              if (res.status === 204 || res.status === 200) {
                alertSuccess({ title: 'Deleted!', customMessage: 'Language deleted successfully' })
                history.push('/languages')
              }
            }).catch(error => {
              alertError({ error: error, customMessage: 'Could not delete economic sector.' })
            })
          }}
        />
      </>}
    </>
  );
}
